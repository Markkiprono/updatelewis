const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();

  //Options for cookie
  const options = {
    expiresIn: new Date(Date.now() + "1d"),
    httpOnly: true,
  };
  res.status(statusCode).cookie("token", token, options).json({
    
    user,
  });
};

module.exports = sendToken;
