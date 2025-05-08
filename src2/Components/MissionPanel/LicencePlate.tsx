
export const LicencePlate = (props: {platenum: string}) => {
    return (<>

        {/* <div style={{
            display: "inline",
            backgroundColor: "blue",
            borderRadius: "3px",
            paddingLeft: 5,
            paddingRight: 5,
            border: "solid 1px black",
            boxShadow: "0px 0px 1px 0px black",
        }}> */}
            <div
                style={{
                    display: 'inline',
                    backgroundColor: 'white',
                    paddingRight: 2,
                    paddingLeft: 2,
                }}
            >
                {props.platenum}
            </div>
        {/* </div> */}

    </>)
}
