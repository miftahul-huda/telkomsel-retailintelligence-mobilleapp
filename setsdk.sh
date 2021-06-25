sed -i .bak "s/targetSdkVersion = 26/targetSdkVersion = $1/" android/build.gradle
sed -i .bak "s/targetSdkVersion = 21/targetSdkVersion = $1/" android/build.gradle
sed -i .bak "s/sdk26/sdk$1/" android/app/src/main/res/values/strings.xml
sed -i .bak "s/sdk21/sdk$1/" android/app/src/main/res/values/strings.xml
rm android/build.gradle.bak
rm android/app/src/main/res/values/strings.xml.bak