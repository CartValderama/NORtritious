function CrudButtons() {
  return (
    <>
      <div
        className="btn-group"
        role="group"
        aria-label="Basic outlined example"
      >
        <a href="#" className="btn btn-outline-primary">
          <i className="bi bi-pencil-square"></i>
        </a>
        <a href="#" className="btn btn-outline-danger">
          <i className="bi bi-trash"></i>
        </a>
      </div>
    </>
  );
}

export default CrudButtons;
