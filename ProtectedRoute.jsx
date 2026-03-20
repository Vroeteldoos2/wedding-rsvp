const ProtectedRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => <Component {...props} />}
    />
  );
};

export default ProtectedRoute;