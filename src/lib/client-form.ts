import type { FormEvent } from "react";

/** Client formlarda action={fn} yerine — UnrecognizedActionError önlenir. */
export function clientFormSubmit(handler: (formData: FormData) => void | Promise<void>) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handler(new FormData(event.currentTarget));
  };
}
