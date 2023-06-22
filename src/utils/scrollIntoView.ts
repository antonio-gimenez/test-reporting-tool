export function scrollIntoView(
  event: React.ChangeEvent<HTMLSelectElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>,
  offsetElement?: HTMLElement
) {
  const { value, name } = event.target as HTMLSelectElement | HTMLButtonElement;

  // scroll to top of page
  if (value === "top" || name === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  // scroll to bottom of page
  if (value === "bottom" || name === "bottom") {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    return;
  }

  const view = document.getElementById(value || name);

  // if view is not found or hidden by another element do nothing
  if (!view || view.offsetParent === null) {
    return;
  }

  // if no offset element is provided scroll to top of element
  if (!offsetElement) {
    window.scrollTo({
      behavior: "smooth",
      top: view.offsetTop
    });
    return;
  }

  // if offset element is provided scroll to top of element minus height of offset element
  const offsetHeight = offsetElement.offsetHeight || 0;
  window.scrollTo({
    top: view.offsetTop - offsetHeight,
    behavior: "smooth",
  });
}