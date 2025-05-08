
import "./pinIcon.css"

export const PinIcon = (props:{
    color:string,
    pinned: boolean
    onPinChange: (pinned:boolean) => void
}) => {


    const handleClick:React.MouseEventHandler<HTMLSpanElement> = (event) => {
        props.onPinChange(!props.pinned)
        event.stopPropagation()
        event.preventDefault()
    }
	
	return (
		<span
            className={`material-symbols-outlined pinIcon ${props.pinned ? "pinned" : ""}`}
            // style={{color: props.color}}
            onClick={handleClick}
        >
			{props.pinned ? "keep" : "keep_off"}
		</span>
	)

}