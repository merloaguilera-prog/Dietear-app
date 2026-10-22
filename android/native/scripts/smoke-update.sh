#!/usr/bin/env bash
set -euo pipefail

: "${BASELINE_APK:?}" "${FIXED_APK:?}" "${SMOKE_OUTPUT:?}"
mkdir -p "$SMOKE_OUTPUT"
app_package=com.dietear.app
launcher_component="$app_package/com.google.androidbrowserhelper.trusted.LauncherActivity"
adb_command=(adb -s emulator-5554)

cleanup() {
  timeout 10 "${adb_command[@]}" logcat -d > "$SMOKE_OUTPUT/final-logcat.txt" 2>/dev/null || true
  timeout 10 "${adb_command[@]}" emu kill >/dev/null 2>&1 || true
}
trap cleanup EXIT

test -e /dev/kvm
sudo chmod 666 /dev/kvm
export ANDROID_USER_HOME="$RUNNER_TEMP/dietear-android-user"
export ANDROID_AVD_HOME="$ANDROID_USER_HOME/avd"
mkdir -p "$ANDROID_AVD_HOME"
printf 'no\n' | avdmanager create avd --force --name dietear-smoke --path "$ANDROID_AVD_HOME/dietear-smoke.avd" --package 'system-images;android-36;google_apis;x86_64'
test -f "$ANDROID_AVD_HOME/dietear-smoke.ini"
"$ANDROID_HOME/emulator/emulator" -list-avds > "$SMOKE_OUTPUT/avd.txt"
grep -Fxq dietear-smoke "$SMOKE_OUTPUT/avd.txt"
adb start-server
"$ANDROID_HOME/emulator/emulator" -avd dietear-smoke -port 5554 -no-window -no-audio -no-boot-anim -no-snapshot -gpu swiftshader_indirect -memory 2048 -cores 2 > "$SMOKE_OUTPUT/emulator.txt" 2>&1 &
emulator_pid=$!
booted=false
boot_deadline=$((SECONDS + 240))
while [ "$SECONDS" -lt "$boot_deadline" ]; do
  if ! kill -0 "$emulator_pid" 2>/dev/null; then
    cat "$SMOKE_OUTPUT/emulator.txt"
    exit 1
  fi
  boot_status="$(timeout 5 "${adb_command[@]}" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)"
  if [ "$boot_status" = 1 ]; then
    booted=true
    break
  fi
  sleep 2
done
test "$booted" = true
"${adb_command[@]}" root
"${adb_command[@]}" wait-for-device
test "$("${adb_command[@]}" shell id -u | tr -d '\r')" = 0
"${adb_command[@]}" shell input keyevent KEYCODE_WAKEUP
"${adb_command[@]}" shell wm dismiss-keyguard
"${adb_command[@]}" shell pm path com.android.chrome
"${adb_command[@]}" shell 'echo "chrome --no-first-run --disable-fre --no-default-browser-check" > /data/local/tmp/chrome-command-line'
"${adb_command[@]}" shell am force-stop com.android.chrome

# Reproduce the exact startup failure from 1.0.1, with R8 enabled.
"${adb_command[@]}" install "$BASELINE_APK"
"${adb_command[@]}" shell dumpsys package "$app_package" > "$SMOKE_OUTPUT/baseline-package.txt"
grep -q 'versionCode=2 ' "$SMOKE_OUTPUT/baseline-package.txt"
"${adb_command[@]}" logcat -c
"${adb_command[@]}" shell am start -W -n "$launcher_component" > "$SMOKE_OUTPUT/baseline-launch.txt" 2>&1 || true
reproduced=false
for attempt in $(seq 1 20); do
  "${adb_command[@]}" logcat -d -s AndroidRuntime:E > "$SMOKE_OUTPUT/baseline-crash.txt"
  if grep -q 'ManageDataLauncherActivity.addSiteSettingsShortcut' "$SMOKE_OUTPUT/baseline-crash.txt"; then
    reproduced=true
    break
  fi
  sleep 1
done
test "$reproduced" = true
grep -q 'IllegalArgumentException' "$SMOKE_OUTPUT/baseline-crash.txt"
grep -q 'Process: com.dietear.app' "$SMOKE_OUTPUT/baseline-crash.txt"

# Keep a fixture in the app's private data to prove this is an in-place update.
app_uid="$("${adb_command[@]}" shell stat -c %u "/data/user/0/$app_package" | tr -d '\r')"
[[ "$app_uid" =~ ^[0-9]+$ ]]
"${adb_command[@]}" shell mkdir -p "/data/user/0/$app_package/files"
"${adb_command[@]}" shell "echo retain-me > /data/user/0/$app_package/files/update-smoke-marker"
"${adb_command[@]}" shell chown -R "$app_uid:$app_uid" "/data/user/0/$app_package/files"
"${adb_command[@]}" shell input keyevent KEYCODE_BACK
"${adb_command[@]}" install -r "$FIXED_APK"
"${adb_command[@]}" shell dumpsys package "$app_package" > "$SMOKE_OUTPUT/fixed-package.txt"
grep -q 'versionCode=3 ' "$SMOKE_OUTPUT/fixed-package.txt"
grep -q 'versionName=1.0.2' "$SMOKE_OUTPUT/fixed-package.txt"
test "$("${adb_command[@]}" shell cat "/data/user/0/$app_package/files/update-smoke-marker" | tr -d '\r')" = retain-me

# Open the updated app twice and require actual DIETEAR page content.
for launch in 1 2; do
  "${adb_command[@]}" shell am force-stop "$app_package"
  "${adb_command[@]}" shell am force-stop com.android.chrome
  "${adb_command[@]}" logcat -c
  "${adb_command[@]}" shell am start -W -n "$launcher_component" > "$SMOKE_OUTPUT/fixed-launch-$launch.txt"
  visible=false
  for attempt in $(seq 1 30); do
    "${adb_command[@]}" shell uiautomator dump /sdcard/dietear-window.xml >/dev/null 2>&1 || true
    "${adb_command[@]}" shell cat /sdcard/dietear-window.xml > "$SMOKE_OUTPUT/fixed-window-$launch.xml" 2>/dev/null || true
    if grep -Eq 'Cuida de ti|Comenzar ahora|TODO SUMA|Alimentación' "$SMOKE_OUTPUT/fixed-window-$launch.xml"; then
      visible=true
      break
    fi
    sleep 2
  done
  "${adb_command[@]}" logcat -d -s AndroidRuntime:E > "$SMOKE_OUTPUT/fixed-runtime-$launch.txt"
  if grep -q 'Process: com.dietear.app' "$SMOKE_OUTPUT/fixed-runtime-$launch.txt"; then
    cat "$SMOKE_OUTPUT/fixed-runtime-$launch.txt"
    exit 1
  fi
  "${adb_command[@]}" exec-out screencap -p > "$SMOKE_OUTPUT/fixed-launch-$launch.png"
  test "$visible" = true
done
printf '%s\n' '{"androidApi":36,"baselineVersion":"1.0.1","baselineCrashReproduced":true,"updatedVersion":"1.0.2","privateDataRetained":true,"successfulColdLaunches":2,"dietearPageVisible":true,"apkBuildType":"minified release; emulator test certificate"}' > "$SMOKE_OUTPUT/result.json"
echo 'Android 16: baseline crash reproduced; 1.0.2 installs as an update and opens twice.'
