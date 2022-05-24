module.exports=(req,res,next)=>{
    if(!req.session.isAuth){
        return res.status(401).redirect('/login');
    }
    next();
}