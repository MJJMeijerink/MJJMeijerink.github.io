from random import random
import math
import json


titles = ["Natural Language Processing", "Machine Learning", "Analyst",
          "Project Manager", "Subject Matter Expert",
          "Knowledge representation"]

activity = ["Pole dancing", "Ice skating", "Hamstering", "Quacking",
            "Ping-ponging", "Day-dreaming", "Fingerprinting", "Debugging",
            "Machine leaning", "Last christmas,", "Procrastinating",
            "Believing", "Berating", "Contemplating", "Climbing", "Boxing",
            "Running", "Semi-working", "Grunting", "Head-banging"]

occupation = ["stripper", "intellectual", "would-be manager", "SQL'er",
              "if-statement collector", "I gave you my heart.",
              "for-loop nester", "black metal listener", "cat-lady",
              "leaf blower", "rule writer", "pretender", "latecomer"]


projects = ["Krappi", "Pinger Frint Engine", "Content3.14", "Rocky",
            "Databricks2.0", "Machine daycare", "QueNovel",
            "Word Sense Indoctrination", "Scopers"]

doesnt_work = ["I only pretend to work.", "Project? What project?",
               "I don't even work here.", "Where am I?"]

vowels = "aeiou"
other = "bcdfghjklmnpqrstvwxyz"

first_names = ["Jennny", "Alexandros", "JJ", "Subhradeep", "Dimitri",
               "Michelle", "Marius", "Georgios", "Janneke", "Yi"]
last_names = ["Truong", "Valetopoulos", "MJJ Meijerink", "Doornenbal",
              "Tsatsaronis", "Alivas", "Gregory", "Illidge", "Kayal", "Berne",
              "van de Loo", "He"]


def generate_name_():
    name_length = math.floor(random() * 9) + 4
    vowel = True if random() > .5 else False
    if vowel:
        s = vowels[math.floor(random() * len(vowels))]
        vowel = False
    else:
        s = other[math.floor(random() * len(other))]
        vowel = True

    while len(s) != name_length:
        if vowel:
            for i in range(math.floor(random() * 2)):
                s += vowels[math.floor(random() * len(vowels))]
            vowel = False
        else:
            for i in range(math.floor(random() * 2)):
                s += other[math.floor(random() * len(other))]
            vowel = True

    return s


def generate_name():
    lfn = len(first_names)
    lln = len(last_names)

    fn = first_names[math.floor(random() * lfn)]
    ln = last_names[math.floor(random() * lln)]

    return fn + " " + ln


def generate_skill():
    activities = len(activity)
    occupations = len(occupation)

    act = activity[math.floor(random() * activities)]
    occ = occupation[math.floor(random() * occupations)]

    return act + " " + occ


def generate_project():
    works_here = True if random() > .3 else False

    if works_here:
        return projects[math.floor(random() * len(projects))]

    else:
        return doesnt_work[math.floor(random() * len(doesnt_work))]


def generate_unique(func, existing):
    unique = False
    while not unique:
        x = func()
        if x not in existing:
            unique = True

    return x


def generate_people(n_people):
    names = {}
    for i in range(n_people):
        name = generate_unique(generate_name, names.keys())

        names[name] = {"skills": [], "projects": [],
                       "job_title": titles[math.floor(random() * len(titles))]}

        for i in range(2):
            skill = generate_unique(generate_skill, names[name]["skills"])
            names[name]["skills"].append(skill)

        for i in range(2):
            if i == 1:
                project = generate_unique(
                    generate_project,
                    names[name]["projects"] + doesnt_work
                )
            else:
                project = generate_unique(generate_project,
                                          names[name]["projects"])
            if project in doesnt_work:
                names[name]["projects"].append(project)
                break

            names[name]["projects"].append(project)
    return names


def print_people(people):
    for person in people:
        print(person)
        for key, value in people[person].items():
            print(f"    {key}")
            if isinstance(value, list):
                for property in people[person][key]:
                    print(f"        * {property}")
            else:
                print(f"        * {value}")


if __name__ == "__main__":
    people = generate_people(80)
    print_people(people)
    with open("/users/meijerinkj/working_dir/projects/skillmap/test_data.json",
              "w", encoding="utf-8") as out:
        json.dump(people, out)

    print(json.dumps(people))
