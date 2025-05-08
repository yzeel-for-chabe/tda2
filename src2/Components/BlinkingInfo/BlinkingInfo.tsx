
import styles from "./BlinkingInfo.module.css";

// Makes the text blink slowly, to draw attention to it
export function BlinkingInfo(props: { children?: React.ReactNode }) {
    return (
        <span className={styles.blinkingText}>
            {props.children}
        </span>
    )
}