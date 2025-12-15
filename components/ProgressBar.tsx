"use client";

import styles from "./ProgressBar.module.css";

interface ProgressBarProps {
  progress: number;
  success: boolean;
}

export default function ProgressBar({ progress, success }: ProgressBarProps) {
  // Round progress to nearest 5 for data attribute matching
  const roundedProgress = Math.min(100, Math.round(progress / 5) * 5);

  return (
    <div className={styles["progress-bar-container"]}>
      <div 
        className={`${styles["progress-bar"]} ${success ? styles["success"] : styles["error"]}`}
        data-progress={roundedProgress}
      />
    </div>
  );
}

