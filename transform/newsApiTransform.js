import { getImageUrl } from "../utils/helper.js";

class newsApiTransform {
  static transform(news) {
    return {
      id: news.id,
      heading: news.title,
      news: news.content,
      image: getImageUrl(news.image),
      created_at: news.created_at,
    };
  }
}

export default newsApiTransform;
