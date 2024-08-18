import { getImageUrl } from "../utils/helper.js";

class newsApiTransform {
  // Static method `transform` jo ek `news` object ko transform karega
  static transform(news) {
    // Return karte hain ek naya object jo transformed news data ko represent karega
    return {
      id: news.id, // News ki ID ko return kar rahe hain
      heading: news.title, // News ki title ko `heading` key ke andar set kar rahe hain
      news: news.content, // News ka content `news` key ke andar set kar rahe hain
      image: getImageUrl(news.image), // Image URL ko transform karte hain using `getImageUrl` function
      created_at: news.created_at, // News ki creation date ko return kar rahe hain
      reporter: {
        id: news?.user.id, // Reporter ki ID ko return kar rahe hain jo news ka user hai
        name: news?.user.name, // Reporter ka name return kar rahe hain
        profile:
          // Agar user ka profile image exist karta hai, toh usko return karo using `getImageUrl` function
          news?.user?.profile != null
            ? getImageUrl(news?.user?.profile)
            : // Agar profile image nahi hai, toh ek default image URL return kar do
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTALYMcTYF3DExgHovymgM3aXLNOAj-xmQMAl7eCwne5Q&s",
      },
    };
  }
}


export default newsApiTransform;
