import React, { forwardRef } from "react"
import PhoneInputComponent, { Props as PhoneInputProps } from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { Input } from "./input"
import { cn } from "@/lib/utils"

type CustomPhoneInputProps = Omit<PhoneInputProps<any>, "inputComponent"> & {
  className?: string
}

// A wrapper for the inner input to remove Shadcn's default borders and focus rings
const PhoneInputInner = forwardRef<HTMLInputElement, any>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        {...props}
        ref={ref}
        className={cn(
          "border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none rounded-none p-0 h-auto w-full",
          className
        )}
      />
    )
  }
)
PhoneInputInner.displayName = "PhoneInputInner"

export const PhoneInput = forwardRef<HTMLInputElement, CustomPhoneInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <PhoneInputComponent
        international
        withCountryCallingCode
        {...(props as any)}
        ref={ref as any}
        inputComponent={PhoneInputInner}
        // We apply standard Shadcn input container styles to the outer wrapper
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
      />
    )
  }
)

PhoneInput.displayName = "PhoneInput"
