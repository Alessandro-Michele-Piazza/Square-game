import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import routes from "../router/routes";
import "../css/components/RouterErrorBoundary.css";

function buildErrorState(error) {
  if (isRouteErrorResponse(error)) {
    const statusText = [error.status, error.statusText].filter(Boolean).join(" ");
    const dataMessage =
      typeof error.data === "string"
        ? error.data
        : typeof error.data?.message === "string"
          ? error.data.message
          : "";

    if (error.status === 404) {
      return {
        statusText,
        title: "Pagina non trovata",
        message:
          dataMessage ||
          "La risorsa che stai cercando non esiste o e stata spostata.",
      };
    }

    if (error.status >= 500) {
      return {
        statusText,
        title: "Servizio temporaneamente non disponibile",
        message:
          dataMessage ||
          "Il server ha risposto con un errore. Riprova tra qualche istante.",
      };
    }

    return {
      statusText,
      title: "Richiesta non completata",
      message:
        dataMessage ||
        "La richiesta non e andata a buon fine. Prova a ricaricare la pagina.",
    };
  }

  if (error instanceof Error && /failed to fetch/i.test(error.message)) {
    return {
      statusText: "Errore di rete",
      title: "Connessione ai dati non disponibile",
      message:
        "Non riesco a contattare il servizio giochi in questo momento. Verifica la connessione o la configurazione API e riprova.",
      details: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      statusText: "Errore inatteso",
      title: "Qualcosa e andato storto",
      message: "Si e verificato un errore non previsto durante il caricamento.",
      details: error.message,
    };
  }

  return {
    statusText: "Errore inatteso",
    title: "Qualcosa e andato storto",
    message: "Si e verificato un errore non previsto durante il caricamento.",
    details: typeof error === "string" ? error : "",
  };
}

export default function RouterErrorBoundary() {
  const routeError = useRouteError();
  const { statusText, title, message, details } = buildErrorState(routeError);

  return (
    <main className="route-error" role="alert" aria-live="assertive">
      <section className="route-error__card">
        <p className="route-error__eyebrow">Application Error</p>
        <p className="route-error__status">{statusText}</p>
        <h1 className="route-error__title">{title}</h1>
        <p className="route-error__message">{message}</p>

        <div className="route-error__actions">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-secondary route-error__action"
          >
            Ricarica pagina
          </button>

          <Link to={routes.landing} className="btn-secondary route-error__action">
            Torna alla landing
          </Link>
        </div>

        {import.meta.env.DEV && details ? (
          <details className="route-error__details">
            <summary>Dettagli tecnici</summary>
            <pre>{details}</pre>
          </details>
        ) : null}
      </section>
    </main>
  );
}
