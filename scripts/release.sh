packageProperty=$(npm bin)/package-property
versionHasChanged=$(npm bin)/version-has-changed
repo="$CIRCLE_PROJECT_USERNAME/$CIRCLE_PROJECT_REPONAME"
for f in packages/*; do
  if [ -d "$f" ] && [ -e "$f/package.json" ]; then
    $versionHasChanged "$f/package.json"
    if [ $? -eq 0 ]; then
      cd "$f"
      name="$($packageProperty name)"
      version="$($packageProperty version)"
      npm publish dist && echo "\"$name@$version\" has been successfully published on NPM"
      echo "Published package $name@$version"
      cd - >/dev/null
    else
      echo "No need to publish $name package"
    fi
  fi
done
