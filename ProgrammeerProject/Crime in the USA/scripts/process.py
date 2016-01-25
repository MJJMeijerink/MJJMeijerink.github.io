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

for state in states.iteritems():
    data[state[1]] = {}
    data[state[1]]['Name'] = state[0]


with open('unemployment.csv','r') as f:
    for entry in data:
        data[entry]['Unemployment'] = {}
    for line in f.readlines():
        line = line.strip('\n ').split(',')
        line = filter(None, line)
        if len(line) == 1:
            name = line[0] 
        elif len(line) > 1:
            line = [line[0]] + map(float, line[1:])
            data[name]['Unemployment'][int(line[0])] = round(sum(line[1:]) / float(len(line[1:])), 2)

with open('CrimeStatebyState.csv', 'r') as f:
    addedCat = False
    for line in f.readlines():
        line = line.strip('\n ').split(',')
        line = filter(None, line)
        if 'Year' in line and not addedCat:
            addedCat = True
            for var in line:
                if 'Population' in var or 'rate' in var:
                    for entry in data:
                        data[entry][var] = {}
        elif len(line) == 1:
            name = line[0]
        elif line:
            if line[0] != 'Year' and len(line) > 1:
                data[name]['Population'][int(line[0])] = int(line[1])
                data[name]['Violent Crime rate'][int(line[0])] = float(line[11])
                data[name]['Murder rate'][int(line[0])] = float(line[12])
                data[name]['Forcible rape rate'][int(line[0])] = float(line[13])
                data[name]['Robbery rate'][int(line[0])] = float(line[14])
                data[name]['Aggravated assault rate'][int(line[0])] = float(line[15])
                data[name]['Property crime rate'][int(line[0])] = float(line[16])
                data[name]['Burglary rate'][int(line[0])] = float(line[17])
                data[name]['Larceny-theft rate'][int(line[0])] = float(line[18])
                data[name]['Motor vehicle theft rate'][int(line[0])] = float(line[19])

with open('output.csv', 'r') as f:
    addedCat = False
    for line in f.readlines():
        line = line.strip('\n ').split(',')
        line = filter(None, line)
        if 'year' in line and not addedCat:
            addedCat = True
            for entry in data:
                data[entry]['Guns per household'] = {}
        elif len(line) == 1:
            name = line[0]
        elif line[0] != 'year' and len(line) > 1:
            if line[0] == '1981':
                data[name]['Guns per household'][line[0] + ' - 1990'] = float(line[1])
            elif line[0] == '1991':
                data[name]['Guns per household'][line[0] + ' - 2000'] = float(line[1])
            elif line[0] == '2001':    
                data[name]['Guns per household'][line[0] + ' - 2010'] = float(line[1])

     
jsonfile = open('data.json', 'w')
json.dump([data], jsonfile)
