import { createContext } from "react";

const ContactsContext = createContext({
  contactList: [],
  loading: false,
  error: null,
});

export default ContactsContext;
