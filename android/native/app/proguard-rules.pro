# Keep Android Browser Helper's TWA launcher and component classes stable.
# The published 1.0.0 build crashes in LauncherActivity while toggling a
# component renamed to 'q7' that is absent from PackageManager.
# AndroidManifest references and PackageManager component names must agree.
-keep class com.google.androidbrowserhelper.trusted.** { *; }
-keep class * extends android.app.Activity { *; }
