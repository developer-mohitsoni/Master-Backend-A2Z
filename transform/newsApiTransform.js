class newsApiTransform{
    static transform(news){
        return {
            id: news.id,
            heading: news.title,
            news: news.content,
            image: news.image
        }
    }
}