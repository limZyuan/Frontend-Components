export default function TableContextMenu(menu, table) {
  let menuVisible = false;

  const toggleMenu = command => {
    menu.style.opacity = command === "show" ? "1" : "0";
    menu.style.pointerEvents = command === "show" ? "auto" : "none";
    menuVisible = !menuVisible;
  };

  const setPosition = ({ top, left }) => {
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    toggleMenu("show");
  };
  if (menu && table) {
    window.addEventListener("click", e => {
      if (menuVisible) toggleMenu("hide");
    });
    const menuDisplay = e => {
      e.preventDefault();
      e.stopPropagation();
      const origin = {
        left: e.pageX,
        top: e.pageY
      };
      setPosition(origin);
      return false;
    };

    table.addEventListener("contextmenu", menuDisplay);
    window.addEventListener("contextmenu", e => {
      if (menuVisible) toggleMenu("hide");
    });
  }
}
