const fs = require('fs');
let content = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8');

content = content.replace('ClipboardList, Book, Search, Plus, X, Upload, Save, Edit, Trash2, Shield, Sword, Eye, Camera, RefreshCw, Layers, Sparkles, BookOpen, User, Users, Info, Settings, Heart, Zap, Tag, MoreHorizontal, MessageSquare, AlertCircle, Menu, Maximize2, Minimize2, Link', 'Book, Plus, X, Upload, Save, Edit, Trash2, Shield, Sword, Eye, Layers, Sparkles, BookOpen, User, Users, Info, Settings, Heart, Zap, Tag, MoreHorizontal, MessageSquare, AlertCircle, Menu, Maximize2, Minimize2');
content = content.replace('const ACTION_TYPES = ', '// const ACTION_TYPES = ');
content = content.replace('const DAMAGE_TYPES = ', '// const DAMAGE_TYPES = ');

fs.writeFileSync('src/renderer/components/DatabaseView.tsx', content);
console.log("Cleaned up final unused variables in DatabaseView");
