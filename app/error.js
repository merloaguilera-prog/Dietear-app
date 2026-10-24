"use client";
import RecoveryScreen from "../components/RecoveryScreen";
export default function Error({reset}) {
  return <RecoveryScreen onRetry={reset}/>;
}
