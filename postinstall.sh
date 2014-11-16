bower install

NODE=./node_modules
BOWER=./static/lib
PACKAGES="three"

for PACKAGE in $PACKAGES
do
  if [ ! -e "$NODE/$PACKAGE" ]
    then
    continue
  fi
  rm -rf $BOWER/$PACKAGE
  mv -v $NODE/$PACKAGE $BOWER/$PACKAGE
done
