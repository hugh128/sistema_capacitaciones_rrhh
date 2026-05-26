"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export interface ComboboxOption {
  value: string
  label: string
  sublabel?: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

const itemBase = cn(
  "cursor-pointer rounded-md mx-1 my-0.5 px-2 py-1.5",
  "hover:bg-accent/20 hover:text-foreground",
  "data-[selected=true]:bg-muted data-[selected=true]:text-foreground",
  "aria-selected:bg-transparent",
)

const itemSelected = cn(
  "bg-primary/15 dark:bg-primary/25",
  "border-l-2 border-primary",
  "pl-[6px]",
)

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyText = "No se encontraron resultados.",
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal dark:border-gray-700",
            "bg-background hover:bg-background",
            "border-input hover:border-ring",
            "text-foreground hover:text-foreground",
            !selected && "text-muted-foreground hover:text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value === option.value
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onValueChange(option.value)
                      setOpen(false)
                    }}
                    className={cn(itemBase, isSelected && itemSelected)}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className={cn(
                        "truncate text-sm",
                        isSelected
                          ? "font-medium text-primary dark:text-blue-300"
                          : "text-foreground"
                      )}>
                        {option.label}
                      </span>
                      {option.sublabel && (
                        <span className="text-xs text-muted-foreground truncate">
                          {option.sublabel}
                        </span>
                      )}
                    </div>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4 shrink-0",
                        isSelected
                          ? "opacity-100 text-primary dark:text-blue-300"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ComboboxCreable
// ─────────────────────────────────────────────────────────────────────────────

interface ComboboxCreableProps extends Omit<ComboboxProps, "emptyText"> {
  crearLabel?: (input: string) => string
}

export function ComboboxCreable({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar o escribir...",
  searchPlaceholder = "Buscar o escribir...",
  crearLabel = (input) => `Usar "${input}"`,
  disabled = false,
  className,
}: ComboboxCreableProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const selected = options.find((o) => o.value === value)
  const displayValue = selected ? selected.label : value || ""

  const isNewValue =
    inputValue.trim().length > 0 &&
    !options.some(
      (o) => o.label.toLowerCase() === inputValue.trim().toLowerCase()
    )

  return (
    <Popover open={open} onOpenChange={(v) => {
      setOpen(v)
      if (!v) setInputValue("")
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            "bg-background hover:bg-background",
            "border-input hover:border-ring",
            "text-foreground hover:text-foreground",
            !displayValue && "text-muted-foreground hover:text-muted-foreground",
            className
          )}
        >
          <span className="truncate">{displayValue || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
      >
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value === option.value
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onValueChange(option.value)
                      setInputValue("")
                      setOpen(false)
                    }}
                    className={cn(itemBase, isSelected && itemSelected)}
                  >
                    <span className={cn(
                      "flex-1 truncate text-sm",
                      isSelected
                        ? "font-medium text-primary dark:text-blue-300"
                        : "text-foreground"
                    )}>
                      {option.label}
                    </span>
                    <Check
                      className={cn(
                        "ml-2 h-4 w-4 shrink-0",
                        isSelected
                          ? "opacity-100 text-primary dark:text-blue-300"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                )
              })}

              {/* Opción de valor libre */}
              {isNewValue && (
                <CommandItem
                  value={`__new__${inputValue}`}
                  onSelect={() => {
                    onValueChange(inputValue.trim().toUpperCase())
                    setInputValue("")
                    setOpen(false)
                  }}
                  className={cn(
                    itemBase,
                    "mt-1 border-t border-border pt-2 rounded-t-none",
                    "text-primary dark:text-blue-300",
                    "hover:bg-primary/10 dark:hover:bg-primary/20",
                  )}
                >
                  <Search className="mr-2 h-3.5 w-3.5 shrink-0" />
                  <span className="text-sm font-medium">
                    {crearLabel(inputValue.trim().toUpperCase())}
                  </span>
                </CommandItem>
              )}
            </CommandGroup>

            {!isNewValue && (
              <CommandEmpty>
                Escribe para crear una categoría personalizada.
              </CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
