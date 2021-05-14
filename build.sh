#!/bin/bash

XPI_FILE=s4e-revived

path=$(dirname "$(realpath -s "$0")")
temp_path="$path"/src_temp

cd "$path"/src || exit

mkdir "$temp_path"
cp -r "$path"/src/* "$temp_path"/

cd "$temp_path" || exit

cp ../LICENSE ./

mapfile -t locales < <(find "$temp_path"/chrome/locale -maxdepth 1 -exec basename {} \; | sed s/en$// | sed s/LICENSE$// | sed s/LICENSE.in$// | sed s/locale$// | sed -r '/^\s*$/d' | sort -u)

for locale in "${locales[@]}"; do
extName=$(grep 'name=' "$temp_path"/chrome/locale/"$locale"/meta.properties | cut -d'=' -f2)
extDesc=$(grep 'description=' "$temp_path"/chrome/locale/"$locale"/meta.properties | cut -d'=' -f2)
extTrans=$(grep 'translator=' "$temp_path"/chrome/locale/"$locale"/meta.properties | cut -d'=' -f2)
extContr=$(grep 'em:contributor=' "$temp_path"/install.rdf | cut -d'=' -f2 | sed -e 's/^"//' -e 's/"$//')
localized+=$(cat <<EOF

    <em:localized>
      <Description
        em:locale="$locale"
        em:name="$extName"
        em:description="$extDesc"
        em:translator="$extTrans"
        em:contributor="$extContr"/>
    </em:localized>
\l
EOF
)
done

localized=$(echo "${localized}" | sed ':a;N;$!ba;s/\n/\\n/g' | sed 's/\$/\\$/g' | sed '/^$/d')
sed -i "s|_localized_|$localized|" "$temp_path"/install.rdf

echo "Creating xpt file"
python2 "$(xdg-user-dir DOWNLOAD)"/firefox-sdk/sdk/bin/typelib.py ./components/status4evar.idl -o ./components/status4evar.xpt -I "$(xdg-user-dir DOWNLOAD)"/firefox-sdk/idl/


echo "Removing old xpi file"
if [ -f "$path/$XPI_FILE.xpi" ]; then
    rm "$path/$XPI_FILE.xpi"
fi

echo "Creating xpi file"
zip -r $XPI_FILE.xpi ./*

cd "$path" || exit
mv "$temp_path/$XPI_FILE".xpi "$path"/
rm -rf "$temp_path"
