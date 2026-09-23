// Sant når en side vises inne i rammen til oppsettene «dashboard» eller «toppmeny» (AppShells). Sidene bruker det til å
// droppe egen tilbakeknapp, full skjermhøyde og smal kolonne, siden rammen har navigasjon og styrer bredden.
import { createContext, useContext } from 'react';

export const InnebygdContext = createContext(false);
export const useInnebygd = () => useContext(InnebygdContext);
