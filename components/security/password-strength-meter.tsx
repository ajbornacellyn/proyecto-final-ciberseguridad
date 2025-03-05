"use client"

interface PasswordStrengthMeterProps {
  strength: number
}

export default function PasswordStrengthMeter({ strength }: PasswordStrengthMeterProps) {
  // Determine color and label based on strength
  const getColorClass = () => {
    if (strength === 0) return "bg-gray-200"
    if (strength < 50) return "bg-red-500"
    if (strength < 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getLabel = () => {
    if (strength === 0) return "Enter password"
    if (strength < 50) return "Weak"
    if (strength < 75) return "Medium"
    return "Strong"
  }

  return (
    <div className="space-y-1">
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${getColorClass()} transition-all duration-300`} style={{ width: `${strength}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: <span className="font-medium">{getLabel()}</span>
      </p>
      <div className="text-xs text-muted-foreground">Use 8+ characters with a mix of letters, numbers & symbols</div>
    </div>
  )
}

