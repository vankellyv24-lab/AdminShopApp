export default function ApplicationLogo(props) {
    return (
        <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="currentColor" />
            <path
                d="M25.6 14.7c-.6-1.8-2.3-3-5-3-2.3 0-4 .7-5 2-.6.7-.9 1.6-.9 2.6 0 2.4 1.6 3.5 4.9 4.1l1.1.2c1.7.3 2.4.8 2.4 1.7 0 1.2-1.2 1.9-3 1.9-2 0-3.4-.7-4-2.2l-2.7 1.1c.9 2.6 3.2 4 6.7 4 3.9 0 6.4-2 6.4-5 0-2.5-1.6-3.7-5-4.3l-1.1-.2c-1.6-.3-2.3-.7-2.3-1.6 0-1.1 1-1.8 2.6-1.8 1.5 0 2.7.6 3.2 1.8l2.7-1.3Z"
                fill="#ffffff"
            />
        </svg>
    );
}
