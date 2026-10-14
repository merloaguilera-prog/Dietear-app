plugins {
    id("com.android.application")
}

val signingStoreFile = providers.gradleProperty("DIETEAR_SIGNING_STORE_FILE")
val signingStorePassword = providers.gradleProperty("DIETEAR_SIGNING_STORE_PASSWORD")
val signingKeyAlias = providers.gradleProperty("DIETEAR_SIGNING_KEY_ALIAS")
val signingKeyPassword = providers.gradleProperty("DIETEAR_SIGNING_KEY_PASSWORD")
val hasReleaseSigning = listOf(
    signingStoreFile,
    signingStorePassword,
    signingKeyAlias,
    signingKeyPassword,
).all { it.isPresent }

android {
    namespace = "com.dietear.app"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.dietear.app"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"
    }

    signingConfigs {
        if (hasReleaseSigning) {
            create("release") {
                storeFile = file(signingStoreFile.get())
                storePassword = signingStorePassword.get()
                keyAlias = signingKeyAlias.get()
                keyPassword = signingKeyPassword.get()
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            if (hasReleaseSigning) {
                signingConfig = signingConfigs.getByName("release")
            }
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("com.google.androidbrowserhelper:androidbrowserhelper:2.7.4")
}
