ENVIRONMENT=""
ENV=""
VERSION=$2
APPCONTENT="<resources>\n\t<string name=\"app_name\">Retail Intelligence V.$VERSION sdk$3</string>\n</resources>"


cp src/config-template.json src/config.json

if [ $1 == "prod" ]
then
    echo "Replacing config-template.json to $1"
    ENVIRONMENT=""
    ENV="prod"

else
    echo "Replacing config-template.json to $1"
    ENVIRONMENT="(DEV)"
    ENV="dev"
fi

sed -i .bak "s/{VERSION}/$VERSION/" src/config.json
sed -i .bak "s/{ENVIRONMENT}/$ENVIRONMENT/" src/config.json
sed -i .bak "s/{env}/$ENV/" src/config.json

sed -i .bak "s/targetSdkVersion = 26/targetSdkVersion = $3/" android/build.gradle
sed -i .bak "s/targetSdkVersion = 21/targetSdkVersion = $3/" android/build.gradle
rm android/app/src/main/res/values/strings.xml
echo -e $APPCONTENT >> android/app/src/main/res/values/strings.xml
rm android/build.gradle.bak

dt=$(date '+%Y%m%d%H%M%S')
echo "Apk name : "
echo "retail-intelligence-$ENV-v.$VERSION-$dt-sdk$3.apk"