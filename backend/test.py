from ai.vectorizer import TagVectorizer

tags = [1,2,3,4,5]
vec = TagVectorizer(tags)

print(vec.vectorize([1,3,5]))