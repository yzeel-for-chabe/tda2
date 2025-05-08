import React from "react";

export const Map = ({children}: {children: any}) => {

    const ref = React.useRef<HTMLDivElement>(null);
    const [map, setMap] = React.useState<google.maps.Map>();

    React.useEffect(() => {
        if (ref.current && !map) {
            console.log("setMap")
            setMap(new window.google.maps.Map(ref.current, {
                center: {lat: 48.8534, lng: 2.3488},
                zoom: 12,
                heading: 90,
            }));
        }
    }, [ref, map]);

    return (
        <>
          <div style={{width: "100%", height: "100%"}} ref={ref} />
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              // set the map prop on the child component
              // @ts-ignore
              return React.cloneElement(child, { map });
            }
          })}
        </>
      );
      
}
