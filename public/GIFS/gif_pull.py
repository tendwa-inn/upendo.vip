import urllib.request as request
import json
import pandas as pd
import gc
# curl "http://api.giphy.com/v1/gifs/search?q=memes&api_key=AACHubWiZHCJz4fEwaMyioTjUV1vZMIH&limit=5000" > full_set.json
output_frame = pd.DataFrame(columns=['key','title','url'])
js = json.load(open('./gif/full_set.json'))

for i in range(0,1000):
	tmp_d = js['data'][i]
	url = tmp_d['images']['fixed_height']['url']
	title = tmp_d['title']
	#request.urlretrieve(url, './gif/' + url.split('/')[4] + '.gif')
	output_frame.at[i] = [url.split('/')[4], title, url]
	del tmp_d
	gc.collect()

output_frame.to_csv('gif_key.csv', index=False)
