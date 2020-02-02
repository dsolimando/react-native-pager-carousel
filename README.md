# react-native-pager

A native based Pager/Carousel. It uses FlatList on iOS and ViewPagerAndroid on Android to assure 60 FPS performance.

# Installation

```bash
# npm install react-native-pger
```

# Usage

````typescript jsx
import { Image } from 'react-native';
import { Pager } from 'react-native-pager';

//...

<Pager
    data={[
        { id: 1, url: 'image1'},
        { id: 2, url: 'image2'},
    ]}
    
    renderItem={ item => <Image
                key={item.id}
                style={{width: 50, height: 50}}
                source={{uri: item.url}}
              />}   
     
/>
````

### Putting space around item

 ```typescript jsx
 import { Image } from 'react-native';
 import { Pager } from 'react-native-pager';
 
 //...
 
 <Pager
     data={[
         { id: 1, url: 'image1'},
         { id: 2, url: 'image2'},
     ]}
     
     renderItem={ item => <Image
                 key={item.id}
                 style={{width: 50, height: 50}}
                 source={{uri: item.url}}
               />}   
      
     marginHorizontal={20}    
 />
 ```

### Preview previous and next item

 ```typescript jsx
 import { Image } from 'react-native';
 import { Pager } from 'react-native-pager';
 
 //...
 
 <Pager
     data={[
         { id: 1, url: 'image1'},
         { id: 2, url: 'image2'},
     ]}
     
     renderItem={ item => <Image
                 key={item.id}
                 style={{width: 50, height: 50}}
                 source={{uri: item.url}}
               />}   
      
     distanceBetweenItems={20}    
 />
 ```

###render a specific item at startup

 ```typescript jsx
 import { Image } from 'react-native';
 import { Pager } from 'react-native-pager';
 
 //...
 
 <Pager
     data={[
         { id: 1, url: 'image1'},
         { id: 2, url: 'image2'},
     ]}
     
     renderItem={ item => <Image
                 key={item.id}
                 style={{width: 50, height: 50}}
                 source={{uri: item.url}}
               />}   
      
     initialItemToRenderIndex={1}    
 />
 ```

# List of Props

```typescript jsx
 <Pager
    data={[]}                        // Array of objetcs containing data
    renderItem={() => <View/>}       // funtion that display carousel entry
    distanceBetweenItems={20}        // insert space between items allowing to preview next and previous item (Optional)
    marginHorizontal={20}            // put space arount displayed item (Optional)
    initialItemToRenderIndex={1}     // initial item rendered when mounting item (Optional)
    animated={true}                  // animate the scrolling to initial item to render (Optional)
    onPageSelected={() => null}      // function called when swiping between items (Optional)
    onScroll={() => null}            // function called on each scroll event (Optional)
 />
 ```