function Overlay({ hidden }) {
  return (
    <div className={`overlay ${hidden ? "hidden" : ""}`} id="overlay"></div>
  )
}

export default Overlay