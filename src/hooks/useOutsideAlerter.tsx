import { useEffect } from "react";

export const useOutsideAlerter = (
  ref: React.RefObject<HTMLInputElement>,
  setDropDown: React.Dispatch<React.SetStateAction<boolean>>
) => {
  useEffect(() => {
    // Close dropdown if clicked outside
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setDropDown(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, setDropDown]);
};
