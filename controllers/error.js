exports.get404=(req,res,next)=>{
    return res.status(404).render('errors/404', {
        pageTitle: 'Page not found',
        path: {}
    });
}