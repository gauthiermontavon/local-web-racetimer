# local-web-racetimer

## firefox configuration

In Firefox, first you need to navigate to about:config in the Firefox browser, 
search for the privacy.file_unique_origin setting, 
and set it from true to false by double-clicking it.
https://support.mozilla.org/fr/kb/configurer-firefox-avec-autoconfig

security.fileuri.strict_origin_policy

## TODO
- Convert project into real POO Javascript
### settings
- settings, discpline mettre message gestion seulement 2 discipline, order 1,2
- rankings table, dynamic max ranking by category / hardcoded in results.js
### start list
- Participant FUN et catégorie FUN
- on enter bib update
### race
- when a athlete finish a lap, reorder his position into table
- undo click on bib if error from operator
- stop timer (only stop if all finished)
- implement reset (are you sure + reset)
- if running => only play/Stop  reset and bib buttons 
### rankings
- consider settings category to generate rankings by category( currently hardcoded)
### général
- implement message error and info (delete, save,) with toast bootstrap
- controles validité (dates, nom, discipline intégrité team)
- export localStorage / import ==> edition
- check scripts externa (jquery, bootstrap-table, ...)


## Technos
https://agnostic.github.io/LocalDB.js/


##User manual
- Faux départ ? Clic sur bouton Reset
- Erreur de saisie : Ctrl+Z ou button undo
- Départ manuel - clic sur button "manuel" de ligne correspondante, seulement si catégorie Fun ou si Partenaire VTT a abandonné (DNF))
- Stop automatique lorsque tous les dossards ont terminé leur course


