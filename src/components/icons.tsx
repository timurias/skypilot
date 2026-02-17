import type { SVGProps } from 'react';

export function SkyPilotLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        fill="currentColor"
        d="M221.56,108.44,147.56,34.44a12,12,0,0,0-17.12,0L56.44,108.44a12,12,0,0,0,0,17.12l74,74a12,12,0,0,0,17.12,0l74-74a12,12,0,0,0,0-17.12ZM139,184H117V152h22Zm0-56H117V96h22Z"
      ></path>
    </svg>
  );
}

export function Drone(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="1em" 
      height="1em" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 12h.01"></path>
      <path d="M7 6h10"></path>
      <path d="M7 18h10"></path>
      <path d="M6 7v10"></path>
      <path d="M18 7v10"></path>
      <path d="M6.34 7.34 4.5 5.5"></path>
      <path d="m17.66 7.34 1.84-1.84"></path>
      <path d="m6.34 16.66-1.84 1.84"></path>
      <path d="m17.66 16.66 1.84 1.84"></path>
    </svg>
  )
}
