import numpy as np

class TagVectorizer:
    def __init__(self, all_tag_ids):
        # map tag_id -> index
        self.tag_to_index = {
            tag_id: idx for idx, tag_id in enumerate(sorted(all_tag_ids))
        }
        self.dim = len(self.tag_to_index)

    def vectorize(self, tag_ids):
        vec = np.zeros(self.dim)
        for tag_id in tag_ids:
            if tag_id in self.tag_to_index:
                vec[self.tag_to_index[tag_id]] = 1
        return vec
