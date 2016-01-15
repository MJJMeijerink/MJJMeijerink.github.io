import json

states = {
        'AK': 'Alaska',
        'AL': 'Alabama',
        'AR': 'Arkansas',
        'AZ': 'Arizona',
        'CA': 'California',
        'CO': 'Colorado',
        'CT': 'Connecticut',
        'DC': 'District of Columbia',
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
        'PR': 'Puerto Rico',
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
        'WY': 'Wyoming',
        'US': 'United States'
}

data = {}
data['states'] = []
for state in states.iteritems():
    data['states'].append({'name': state[1], 'abbr': state[0]})

with open('unemployment.csv','r') as f:
    for line in f.readlines():
        line = line.strip('\n ').split(',')
        line = filter(None, line)
        if len(line) == 1:
            x = []
            name = line[0]
        elif len(line) > 1:
            line = [line[0]] + map(float, line[1:])
            x.append(round(sum(line[1:]) / float(len(line[1:])), 2))
        for state in data['states']:
            if state['name'] == name:
                state['Unemployment'] = x

with open('CrimeStatebyState.csv', 'r') as f:
    for line in f.readlines():
        line = line.strip('\n ').split(',')
        line = filter(None, line)
        if len(line) == 1:
            l1 = []
            l2 = []
            l3 = []
            l4 = []
            l5 = []
            l6 = []
            l7 = []
            l8 = []
            l9 = []
            l10 = []
            name = line[0]
        elif line:
            if line[0] != 'Year' and len(line) > 1:
                l1.append(int(line[1]))
                l2.append(float(line[11]))
                l3.append(float(line[12]))
                l4.append(float(line[13]))
                l5.append(float(line[14]))
                l6.append(float(line[15]))
                l7.append(float(line[16]))
                l8.append(float(line[17]))
                l9.append(float(line[18]))
                l10.append(float(line[19]))
        for state in data['states']:
            if state['name'] == name:
                state['Population'] = l1
                state['Violent Crime rate'] = l2
                state['Murder rate'] = l3
                state['Forcible rape rate'] = l4
                state['Robbery rate'] = l5
                state['Aggravated assault rate'] = l6
                state['Property crime rate'] = l7
                state['Burglary rate'] = l8
                state['Larceny-theft rate'] = l9
                state['Motor vehicle theft rate'] = l10

with open('Guns.csv', 'r') as f:
    for line in f.readlines():
        line = line.strip('\n ').split(',')
        line = filter(None, line)
        if len(line) == 1:
            l1 = []
            name = line[0]
        elif line[0] != 'year' and len(line) > 1:
                l1.append(float(line[1]))
        for state in data['states']:
            if state['name'] == name:
                state['Guns per household'] = l1

     
jsonfile = open('data.json', 'w')
json.dump([data], jsonfile)
