import json,re,os,sys
f='/root/.claude/projects/-home-user-Mathematics-app/4484e4a1-65fc-5c6b-b0cb-4677e50a78c1.jsonl'
files={}
log=[]
def apply_hunks(txt,body,path):
    # body: lines of an Update section
    lines=body.split('\n')
    hunks=[];cur=[]
    for ln in lines:
        if ln.startswith('@@'):
            if cur: hunks.append(cur)
            cur=[]
        elif ln.startswith('*** End of File'): pass
        else: cur.append(ln)
    if cur: hunks.append(cur)
    pos=0
    for h in hunks:
        old=[];new=[]
        for ln in h:
            if ln.startswith('+'): new.append(ln[1:])
            elif ln.startswith('-'): old.append(ln[1:])
            elif ln.startswith(' '): old.append(ln[1:]);new.append(ln[1:])
            elif ln=='' : old.append('');new.append('')
        o='\n'.join(old);n='\n'.join(new)
        i=txt.find(o,pos)
        if i<0: i=txt.find(o)
        if i<0:
            # try stripping trailing blank
            o2=o.rstrip('\n');n2=n.rstrip('\n')
            i=txt.find(o2)
            if i<0: log.append(('HUNKFAIL',path,o[:80])); continue
            o,n=o2,n2
        txt=txt[:i]+n+txt[i+len(o):]
        pos=i+len(n)
    return txt
for line in open(f):
    try: d=json.loads(line)
    except: continue
    c=d.get('message',{}).get('content')
    if not isinstance(c,list): continue
    for b in c:
        if b.get('type')!='tool_use': continue
        nm=b['name'];i=b['input']
        if not nm.startswith('mcp__Floot__'): continue
        t=nm.split('__')[-1]
        if t=='write_file': files[i['path']]=i['content']
        elif t=='edit_file':
            p=i['path']
            if p not in files: log.append(('NOFILE',p));continue
            o=i['old_string'];n=i['new_string']
            if o not in files[p]: log.append(('EDITFAIL',p,o[:60]));continue
            files[p]=files[p].replace(o,n) if i.get('replace_all') else files[p].replace(o,n,1)
        elif t=='apply_patch':
            p=i['patch']
            secs=re.split(r'\n(?=\*\*\* (?:Add File|Update File|Delete File): )',p)
            for s in secs:
                m=re.match(r'\*\*\* (Add File|Update File|Delete File): (\S+)\n?(.*)',s,re.S)
                if not m: continue
                kind,path,body=m.groups()
                body=re.sub(r'\n?\*\*\* End Patch\s*$','',body)
                if kind=='Add File': files[path]='\n'.join(l[1:] if l.startswith('+') else l for l in body.split('\n'))
                elif kind=='Delete File': files.pop(path,None)
                else:
                    if path not in files: log.append(('NOFILE-U',path));continue
                    files[path]=apply_hunks(files[path],body,path)
        elif t=='delete_file': files.pop(i['path'],None)
        elif t=='rename_file': 
            if i.get('from') in files: files[i['to']]=files.pop(i['from'])
        elif t=='copy_file':
            if i.get('from') in files: files[i['to']]=files[i['from']]
json.dump(files,open('/tmp/build/replayed.json','w'))
print(len(files),'files; log:',log[:20])
