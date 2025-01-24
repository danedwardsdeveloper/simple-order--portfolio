export default function CompanyLogo() {
  return (
    <svg
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      <g>
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="47"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M 46 419c0 26 21 47 47 47h326c26 0 47-21 47-47V93c0-26-21-47-47-47H93c-26 0-47 21-47 47z"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="59"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M 121 270l108 108 162-244"
        />
      </g>
    </svg>
  )
}

export function CheckboxIcon() {
  return (
    <svg
      fill="none"
      viewBox="0 0 14 14"
      className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
    >
      <path
        d="M3 8L6 11L11 3.5"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-0 group-has-[:checked]:opacity-100"
      />
      <path
        d="M3 7H11"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-0 group-has-[:indeterminate]:opacity-100"
      />
    </svg>
  )
}
