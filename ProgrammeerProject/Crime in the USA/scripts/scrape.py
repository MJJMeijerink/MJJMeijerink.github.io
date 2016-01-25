import csv
import urllib2
from bs4 import BeautifulSoup
# or if you're using BeautifulSoup4:
# from bs4 import BeautifulSoup

states = {
        'AK': 'Alaska',
        'AL': 'Alabama',
        'AR': 'Arkansas',
        'AZ': 'Arizona',
        'CA': 'California',
        'CO': 'Colorado',
        'CT': 'Connecticut',
        'DE': 'Delaware',
        'FL': 'Florida',
        'GA': 'Georgia',
        'HI': 'Hawaii',
        'IA': 'Iowa',
        'ID': 'Idaho',
        'IL': 'Illinois',
        'IN': 'Indiana',
        'KS': 'Kansas',
        'KY': 'Kentucky',
        'LA': 'Louisiana',
        'MA': 'Massachusetts',
        'MD': 'Maryland',
        'ME': 'Maine',
        'MI': 'Michigan',
        'MN': 'Minnesota',
        'MO': 'Missouri',
        'MS': 'Mississippi',
        'MT': 'Montana',
        'NC': 'North Carolina',
        'ND': 'North Dakota',
        'NE': 'Nebraska',
        'NH': 'New Hampshire',
        'NJ': 'New Jersey',
        'NM': 'New Mexico',
        'NV': 'Nevada',
        'NY': 'New York',
        'OH': 'Ohio',
        'OK': 'Oklahoma',
        'OR': 'Oregon',
        'PA': 'Pennsylvania',
        'RI': 'Rhode Island',
        'SC': 'South Carolina',
        'SD': 'South Dakota',
        'TN': 'Tennessee',
        'TX': 'Texas',
        'UT': 'Utah',
        'VA': 'Virginia',
        'VT': 'Vermont',
        'WA': 'Washington',
        'WI': 'Wisconsin',
        'WV': 'West Virginia',
        'WY': 'Wyoming'
}

d = {}
l = []
for state in states.iteritems():
    print state
    soup = BeautifulSoup(urllib2\
        .urlopen('http://www.gunpolicy.org/firearms/region/' + state[1].lower()).read())
    for string in soup.find(id="average_gun_ownership_levels_by_us_state_and_decade")\
          .strings:
        if '%' in string:
            l.append(string)
    d[state[1]] = l
    l = []

with open('output.csv', 'wb') as output:
    writer = csv.writer(output)
    for x in d.iteritems():
        writer.writerow([x[0]])
        writer.writerow(['year', 'perc'])
        for y in x[1]:
            writer.writerow(y.split(': '))
