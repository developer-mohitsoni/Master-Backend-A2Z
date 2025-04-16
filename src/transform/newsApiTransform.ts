import { getImageUrl } from "../utils/helper.js";

interface News {
	id: number;
	title: string;
	content: string;
	image: string;
	created_at: Date;
	user: {
		id: number;
		name: string;
		profile?: string | null;
	};
}

class newsApiTransform {
	static transform(news: News): object {
		return {
			id: news.id,
			heading: news.title,
			news: news.content,
			image: getImageUrl(news.image),
			created_at: news.created_at,
			reporter: {
				id: news?.user.id,
				name: news?.user.name,
				profile:
					news?.user?.profile != null
						? getImageUrl(news?.user?.profile)
						: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTALYMcTYF3DExgHovymgM3aXLNOAj-xmQMAl7eCwne5Q&s"
			}
		};
	}
}

export default newsApiTransform;
