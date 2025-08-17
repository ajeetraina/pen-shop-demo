db = db.getSiblingDB('penstore');
db.papers.insertMany([
    { title: 'Sample Paper 1', authors: 'Author A', source: 'arXiv' },
    { title: 'Sample Paper 2', authors: 'Author B', source: 'PubMed' }
]);
print('Database initialized');
