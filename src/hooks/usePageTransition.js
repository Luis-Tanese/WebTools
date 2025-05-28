import { useContext } from "react";
import { TransitionContext } from "../contexts/TransitionContext";

export const usePageTransition = () => useContext(TransitionContext);
