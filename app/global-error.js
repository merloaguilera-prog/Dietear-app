"use client";
import RecoveryScreen from "../components/RecoveryScreen";
export default function GlobalError({reset}) {
  return <html lang="es"><body style={{margin:0}}><RecoveryScreen onRetry={reset}/></body></html>;
}
