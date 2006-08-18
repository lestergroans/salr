set x=%cd%
md build\chrome
md build\components
cd chrome
7z a -tzip "%x%.jar" * -r -mx=0
move "%x%.jar" ..\build\chrome
cd ..
copy install.* build
copy chrome.manifest build
copy components build\components
cd build
7z a -tzip "%x%.xpi" * -r -mx=9
move "%x%.xpi" ..\
cd ..
rd build /s/q