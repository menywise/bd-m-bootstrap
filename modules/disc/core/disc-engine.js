window.DiscEngine = (function () {
    function getPersona(code) { return DiscPersonaStore.get(code); }
    function getAllPersonas()  { return DiscPersonaStore.getAll(); }
    function getScenario(id)  { return DiscScenarios.get(id); }
    function listScenarios()  { return DiscScenarios.list(); }

    function exportPrompt(codes, scenarioId) {
        var personas = codes.map(getPersona).filter(Boolean);
        var sc = scenarioId ? getScenario(scenarioId) : null;
        var L = ['# CONTEXTE PÉDAGOGIQUE — DISC_ENGINE v2.1\n# ⚠️ Données sandbox\n'];
        L.push('## PERSONAS\n');
        personas.forEach(function(p) {
            L.push('### '+p.prenom+' '+p.nom+' — '+p.rolePedago);
            L.push('- DISC : '+p.DISC+' ('+DiscSchema.DISC_TYPES[p.DISC].label+')');
            L.push('- Ennéagramme : Type '+p.ennea+' — '+DiscSchema.ENNEA[p.ennea]);
            L.push('- Savoir-être : '+p.savoirEtre.join(', '));
            L.push('- AT base : '+p.AT.base.join(', ')+' / stress : '+p.AT.stress.join(', '));
            L.push('- Position de vie : '+p.AT.position);
            L.push('- VAKOG : '+p.VAKOG.primary+' (primaire), '+p.VAKOG.secondary+' (secondaire)');
            L.push('- Méta-programmes : '+p.meta.join(', ')+'\n');
        });
        if (sc) {
            L.push('## SCÉNARIO : '+sc.titre+' (v'+sc.version+')\n');
            L.push('**Contexte** : '+sc.contexte+'\n');
            sc.scenes.forEach(function(s,i) {
                L.push('### Scène '+(i+1)+' — '+s.titre);
                L.push('**Objectif** : '+s.objectif);
                L.push('**Points bascule** : '+s.bascule.join(' | '));
                L.push('**Débriefing** : '+s.debrief.join(' | ')+'\n');
            });
        }
        L.push('---\nTu es expert en simulation pédagogique soins infirmiers. Joue les scènes en respectant strictement les profils DISC, AT et VAKOG.');
        return L.join('\n');
    }
    function exportJSON(codes, scenarioId) {
        var personas = codes.map(getPersona).filter(Boolean);
        var sc = scenarioId ? getScenario(scenarioId) : null;
        return JSON.stringify({ _meta:{ module:'DISC_ENGINE', version:'2.1-sandbox', sandbox:true }, personas:personas, scenario:sc }, null, 2);
    }
    return Object.freeze({ getPersona:getPersona, getAllPersonas:getAllPersonas, getScenario:getScenario, listScenarios:listScenarios, exportPrompt:exportPrompt, exportJSON:exportJSON });
}());

