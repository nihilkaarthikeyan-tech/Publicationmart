export default function ApplicationLogo(props) {
    return (
        <img
            {...props}
            src={`${route('welcome')}/images/logo_new.png`}
            alt="PublicationMart - Self Publishing Platform for Authors in India"
            className={`object-contain ${props.className || ''}`}
        />
    );
}
