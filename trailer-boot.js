"use strict";

if (new URLSearchParams(location.search).get("trailer") === "1") {
  document.documentElement.classList.add("trailer-capture-boot");
}
